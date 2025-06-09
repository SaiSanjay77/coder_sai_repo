abstract class Shape {
    abstract double calculateArea();
}

class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

   double calculateArea() {
        return Math.PI * radius * radius;
    }
}

public class abstract_class {
    public static void main(String[] args) {
        Shape circle = new Circle(5);
        System.out.println("Area of circle: " + circle.calculateArea());
    }
}
