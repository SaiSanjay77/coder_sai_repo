package sai_package;
public class testing_package_access {
    Circle circle = new Circle(5);
    double area = circle.calculateArea();
    public static void main(String[] args) {
        testing_package_access test = new testing_package_access();
        System.out.println("The area of the circle is: " + test.area);
    }
}
