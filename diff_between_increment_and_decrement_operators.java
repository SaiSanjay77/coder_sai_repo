public class diff_between_increment_and_decrement_operators {
    public static void main(String[] args) {
        int a = 10;
        int b = ++a;
        int c = a++;
        System.out.println(b);
        //output will be 11
        System.out.println(c);
        //output will be 10
    }
}
