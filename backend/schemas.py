from pydantic import BaseModel
from typing import Optional

class FarmerCreate(BaseModel):
    FarmerID: int
    Name: str
    Phone: str
    Location: str

class BuyerCreate(BaseModel):
    BuyerID: int
    Name: str
    Phone: str
    City: str

class WarehouseCreate(BaseModel):
    WarehouseID: int
    Location: str
    Capacity: Optional[int] = 5000

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
