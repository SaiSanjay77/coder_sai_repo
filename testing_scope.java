public class testing_scope {
    public static void main(String[] args) {
        int a = 10;
        System.out.println(a);
        if (a == 10) {
            int b = 20;
            System.out.println(b);
        }
        System.out.println(a);
    }
}
