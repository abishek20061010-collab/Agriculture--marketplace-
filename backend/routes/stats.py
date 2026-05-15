from fastapi import APIRouter, HTTPException
from firebase import db

router = APIRouter()

@router.get('/farmer/{farmer_id}')
def get_farmer_stats(farmer_id: int):
    try:
        # Total crops
        crops = list(db.collection('Crop').where('FarmerID', '==', farmer_id).stream())
        total_crops = len(crops)
        
        # Total orders involving this farmer's crops
        crop_ids = [c.to_dict().get('CropID') for c in crops]
        total_orders = 0
        total_revenue = 0
        if crop_ids:
            for c_id in crop_ids:
                orders = db.collection('Orders').where('CropID', '==', c_id).stream()
                for o in orders:
                    total_orders += 1
        
        # For simplicity, calculate revenue here (or query payments for these orders)
                
        return {
            'total_crops': total_crops,
            'total_orders': total_orders,
            'total_revenue': total_revenue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
