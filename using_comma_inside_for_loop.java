public class using_comma_inside_for_loop {
    public static void main(String[] args) {
        for (int i = 0, j = 10; i < j; i++, j--) {
            System.out.println("The i value is: " + i);
            System.out.println("The j value is: " + j);
        }
    }
}
