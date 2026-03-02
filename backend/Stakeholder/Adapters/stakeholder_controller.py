from flask import Blueprint, request, jsonify
from Database.config import get_db
from Stakeholder.Adapters.stakeholder_service import StakeholderService

router = Blueprint('stakeholders', __name__, url_prefix='/api/v1/stakeholders')

@router.route('/search', methods=['GET'])
def search_stakeholders():
    query = request.args.get('q', '').strip()
    stakeholder_type = request.args.get('type', 'all').lower()
    limit = int(request.args.get('limit', 10))
    
    # We allow empty query to just return the first few results of that type
    
    db = next(get_db())
    service = StakeholderService(db)
    
    try:
        results = service.search_all_stakeholders(
            query=query, 
            limit=limit, 
            stakeholder_type=stakeholder_type
        )
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
