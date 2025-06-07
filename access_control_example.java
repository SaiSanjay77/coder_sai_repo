class test1{
    int a;
    public int b;
    private int c;
    void setc(int i){
        c = i;
    }
    int getc(){
        return c;
    }
}

public class access_control_example {
    public static void main(String[] args) {
        test1 t = new test1();
        t.setc(10);
        System.out.println(t.getc());
    }
}
