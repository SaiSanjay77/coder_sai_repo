import java.util.Scanner;
public class illegal_argument_exception_with_exception_handling {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.println("Enter the number: ");
        int num = s.nextInt();
        try {
            int square = num * num;
            System.out.println("The square of the number is: " + square);
        } catch (IllegalArgumentException e) {
            System.out.println("The number entered is not a positive integer or integer.");
        }
    }
}