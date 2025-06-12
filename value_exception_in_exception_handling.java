public class value_exception_in_exception_handling {
    public static void main(String[] args) {
        try {
            int x = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic Exception Occurred");
        }
    }
}