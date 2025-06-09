class test2 {
    void show(){
        System.out.println("Hello dumbo's");
    }
}
class test3 extends test2 {
    void show(){
        System.out.println("Hello Geniuses");
    }
}

public class method_overriding {
    public static void main(String [] args){
        test3 obj = new test3();
        obj.show();
    }

}
