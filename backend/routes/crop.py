from fastapi import APIRouter, HTTPException
from firebase import db
from schemas import CropCreate, PriceUpdate

router = APIRouter()

@router.get('/all')
def get_all_crops():
    try:
        crops_ref = db.collection('Crop').stream()
        results = []
        for doc in crops_ref:
            crop_data = doc.to_dict()
            farmer_id = crop_data.get('FarmerID')
            farmer_data = {}
            if farmer_id:
                farmers_ref = db.collection('Farmer').where('FarmerID', '==', farmer_id).limit(1).stream()
                for f_doc in farmers_ref:
                    farmer_data = f_doc.to_dict()
            
            results.append({
                'CropID': crop_data.get('CropID'),
                'CropName': crop_data.get('CropName'),
                'PricePerKg': crop_data.get('PricePerKg'),
                'FarmerName': farmer_data.get('Name'),
                'FarmerLocation': farmer_data.get('Location'),
                'FarmerID': farmer_id
            })
        
        results.sort(key=lambda x: x['CropName'] if x['CropName'] else '')
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/farmer/{farmer_id}')
def get_crops_by_farmer(farmer_id: int):
    try:
        crops_ref = db.collection('Crop').where('FarmerID', '==', farmer_id).stream()
        return [doc.to_dict() for doc in crops_ref]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/add')
def add_crop(crop: CropCreate):
    try:
        db.collection('Crop').add(crop.dict())
        return {'message': 'Crop added', 'CropID': crop.CropID}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/{crop_id}/price')
def update_crop_price(crop_id: int, price_data: PriceUpdate):
    try:
        crops_ref = list(db.collection('Crop').where('CropID', '==', crop_id).limit(1).stream())
        if not crops_ref:
            raise HTTPException(status_code=404, detail='Crop not found')
            
        crops_ref[0].reference.update({'PricePerKg': price_data.price})
        return {'message': 'Price updated', 'CropID': crop_id, 'new_price': price_data.price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/{crop_id}')
def delete_crop(crop_id: int):
    try:
        orders_ref = list(db.collection('Orders').where('CropID', '==', crop_id).limit(1).stream())
        if orders_ref:
            raise HTTPException(status_code=400, detail='Cannot delete crop because it is referenced in an order.')
            
        allocations_ref = db.collection('WarehouseAllocation').where('CropID', '==', crop_id).stream()
        for doc in allocations_ref:
            doc.reference.delete()
            
        crops_ref = list(db.collection('Crop').where('CropID', '==', crop_id).limit(1).stream())
        if not crops_ref:
            raise HTTPException(status_code=404, detail='Crop not found.')
            
        crops_ref[0].reference.delete()
        return {'message': f'Crop {crop_id} deleted successfully.'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
