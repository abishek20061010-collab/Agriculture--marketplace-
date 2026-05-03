from pydantic import BaseModel
from typing import Optional

class CropCreate(BaseModel):
    CropID: int
    CropName: str
    PricePerKg: float
    FarmerID: int

class PriceUpdate(BaseModel):
    price: float

class OrderCreate(BaseModel):
    BuyerID: int
    CropID: int
    WarehouseID: int
    Quantity: int
    OrderDate: Optional[str] = None
    Status: str = "PLACED"

class PaymentCreate(BaseModel):
    PaymentID: int
    OrderID: int
    Amount: float

class TransportCreate(BaseModel):
    TransportID: int
    OrderID: int
    VehicleNo: str
    DriverName: str

class StatusUpdate(BaseModel):
    status: str

class AllocationCreate(BaseModel):
    WarehouseID: int
    CropID: int
    Quantity: int

class LocationUpdate(BaseModel):
    location: str
