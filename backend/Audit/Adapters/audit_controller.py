import uuid
import json
from flask import Blueprint, request, jsonify
from Database.config import get_db
from Audit.Domain.audit_log import AuditLog
from Audit.Adapters.audit_repository import AuditRepository
from CommonLayer.middleware.auth_middleware import require_role
from datetime import datetime, timezone

router = Blueprint('audit', __name__, url_prefix='/api/v1/audit')


@router.route('/logs', methods=['GET'])
@require_role('admin')
def get_audit_logs():
    """
    Obtiene los registros de auditoría con filtros opcionales
    Query params:
    - user_id (opcional)
    - table_name (opcional)
    - start_date (YYYY-MM-DD, opcional)
    - end_date (YYYY-MM-DD, opcional)
    - skip (default 0)
    - limit (default 100)
    """
    try:
        db = next(get_db())
        repo = AuditRepository(db)
        
        user_id = request.args.get('user_id')
        table_name = request.args.get('table_name')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        
        # Obtener logs basado en filtros
        if user_id:
            logs = repo.get_by_user(user_id, skip=skip, limit=limit)
        elif table_name:
            logs = repo.get_by_table(table_name, skip=skip, limit=limit)
        elif start_date_str and end_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str).replace(tzinfo=timezone.utc)
                end_date = datetime.fromisoformat(end_date_str).replace(tzinfo=timezone.utc)
                logs = repo.get_by_date_range(start_date, end_date, skip=skip, limit=limit)
            except ValueError:
                return jsonify({"error": "Invalid date format"}), 400
        else:
            logs = repo.get_all(skip=skip, limit=limit)
        
        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "user_id": log.user_id,
                "user_name": log.user_name,
                "action": log.action,
                "table_name": log.table_name,
                "record_id": log.record_id,
                "old_values": json.loads(log.old_values) if log.old_values else None,
                "new_values": json.loads(log.new_values) if log.new_values else None,
                "description": log.description,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            })
        
        return jsonify({
            "status": "success",
            "count": len(result),
            "logs": result
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/logs/<log_id>', methods=['GET'])
@require_role('admin')
def get_audit_log(log_id):
    """Obtiene un registro de auditoría específico"""
    try:
        db = next(get_db())
        repo = AuditRepository(db)
        
        log = repo.get_by_id(log_id)
        if not log:
            return jsonify({"error": "Audit log not found"}), 404
        
        return jsonify({
            "status": "success",
            "log": {
                "id": log.id,
                "user_id": log.user_id,
                "user_name": log.user_name,
                "action": log.action,
                "table_name": log.table_name,
                "record_id": log.record_id,
                "old_values": json.loads(log.old_values) if log.old_values else None,
                "new_values": json.loads(log.new_values) if log.new_values else None,
                "description": log.description,
                "ip_address": log.ip_address,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/logs', methods=['POST'])
@require_role('admin')
def create_audit_log():
    """
    Crea un nuevo registro de auditoría
    Body:
    {
        "user_id": "string",
        "user_name": "string (optional)",
        "action": "CREATE|UPDATE|DELETE|READ",
        "table_name": "string",
        "record_id": "string",
        "old_values": {} (optional),
        "new_values": {} (optional),
        "description": "string (optional)",
        "ip_address": "string (optional)"
    }
    """
    try:
        db = next(get_db())
        repo = AuditRepository(db)
        
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['user_id', 'action', 'table_name', 'record_id']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Crear registro
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            user_id=data.get('user_id'),
            user_name=data.get('user_name'),
            action=data.get('action'),
            table_name=data.get('table_name'),
            record_id=data.get('record_id'),
            old_values=json.dumps(data.get('old_values')) if data.get('old_values') else None,
            new_values=json.dumps(data.get('new_values')) if data.get('new_values') else None,
            description=data.get('description'),
            ip_address=data.get('ip_address')
        )
        
        created_log = repo.create(audit_log)
        
        return jsonify({
            "status": "success",
            "id": created_log.id
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@router.route('/summary', methods=['GET'])
@require_role('admin')
def get_audit_summary():
    """Obtiene un resumen de la auditoría por tabla y usuario"""
    try:
        db = next(get_db())
        repo = AuditRepository(db)
        
        # Obtener todos los logs
        all_logs = repo.get_all(skip=0, limit=10000)
        
        # Agrupar por tabla
        by_table = {}
        by_user = {}
        by_action = {}
        
        for log in all_logs:
            # Por tabla
            if log.table_name not in by_table:
                by_table[log.table_name] = 0
            by_table[log.table_name] += 1
            
            # Por usuario
            user_key = log.user_name or log.user_id
            if user_key not in by_user:
                by_user[user_key] = 0
            by_user[user_key] += 1
            
            # Por acción
            if log.action not in by_action:
                by_action[log.action] = 0
            by_action[log.action] += 1
        
        return jsonify({
            "status": "success",
            "total_logs": len(all_logs),
            "by_table": by_table,
            "by_user": by_user,
            "by_action": by_action
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
