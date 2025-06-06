class constructor_overloading {
    public constructor_overloading()
    {
        System.out.println("This does nothing");
    }
    public constructor_overloading(int a)
    {
        System.out.println("This displays a number:"+ a);
    }
    public constructor_overloading(int a, int b)
    {
        System.out.println("This adds the value of two variables:"+ (a+b));
    }

}
public class constructor_overloading_program {
    public static void main(String[] args) {
        constructor_overloading obj = new constructor_overloading();
        constructor_overloading obj1 = new constructor_overloading(10);
        constructor_overloading obj2 = new constructor_overloading(10,20);
    }
}
