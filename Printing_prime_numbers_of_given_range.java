import java.util.Scanner;
public class Printing_prime_numbers_of_given_range {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.println("Enter the upper limit of the range: ");
        int n = s.nextInt();
        for (int i = 2; i <= n; i++) {
            boolean prime = true;
            for (int j = 2; j <= i / 2; j++) {
                if (i % j == 0) {
                    prime = false;
                    break;
                }
            }
            if (prime) {
                System.out.println(i);
            }
        }
        s.close();
    }
}
