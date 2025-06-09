
class Car {
    String model;
    int year;
    int price;
    Car(String model,int year, int price) {
        this.model = model;
        this.year = year;
        this.price = price;
    }
    public void display(){
        System.out.println("Model is :"+ model);
        System.out.println("Year is:"+year);
        System.out.println("Price is:"+price);
    }
}
public class class_test{
    public static void main(String[] args){
        Car obj= new Car("bolero",2023,780000);
        Car obj1= new Car("Nano",2005,175000);
        obj.display();
        obj1.display();
    }
}