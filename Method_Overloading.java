class MethodOL{
    void test()
    {
        System.out.println("This function is useless as heck");
    }
    void test(int a){
        System.out.println("Now, It prints some useless value:"+a);
    }
    void test(int a,int b){
        System.out.println("Now, It prints some sum of two unknown crappy numbers:"+(a+b));
    }
    // end of the crappy class af
}

public class Method_Overloading {
    public static void main(String[] args)
    {
        MethodOL obj = new MethodOL();
        obj.test();
        obj.test(7);
        obj.test(7,18);
    }

}
