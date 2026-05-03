from fastapi import APIRouter
from database import execute_query

router = APIRouter()

@router.get("/all")
def get_all_buyers():
    query = """
        SELECT B.BuyerID, B.Name, B.Phone, B.City,
               COUNT(O.OrderID) AS total_orders,
               COALESCE(SUM(O.Quantity * C.PricePerKg), 0) AS total_spent,
               MAX(O.OrderDate) AS last_order_date
        FROM Buyer B
        LEFT JOIN Orders O ON B.BuyerID = O.BuyerID
        LEFT JOIN Crop C ON O.CropID = C.CropID
        GROUP BY B.BuyerID, B.Name, B.Phone, B.City
        ORDER BY total_spent DESC
    """
    return execute_query(query)
