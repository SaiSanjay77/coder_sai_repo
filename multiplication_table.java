import java.util.Scanner;
public class multiplication_table {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int a = 7;
        System.out.println("Enter the lower limit the multiplication table of: ");
        int lowerLimit = s.nextInt();
        System.out.println("Enter the upper limit the multiplication table of: ");
        int upperLimit = s.nextInt();
        for (int i = lowerLimit; i <= upperLimit; i++) {
            System.out.println(a + " * " + i + " = " + a * i);
        }
    }
}
