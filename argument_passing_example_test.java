class argument_passing_example {
    void test(int a, int b)
    {
        a = a/2;
        b = b*2;
    }
}
public class argument_passing_example_test {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        System.out.println("a is: " + a);
        System.out.println("b is: " + b);
        argument_passing_example obj = new argument_passing_example();
        obj.test(a, b);
        //There is no change in this thing since a and b are primitive data types.
        System.out.println("a is: " + a);
        System.out.println("b is: " + b);
    }
}