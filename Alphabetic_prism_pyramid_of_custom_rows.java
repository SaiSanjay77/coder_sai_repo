import java.util.Scanner;
public class Alphabetic_prism_pyramid_of_custom_rows {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.println("Enter the number of rows: ");
        int n = s.nextInt();
        for (int i = 1; i <= n; i++) {
            for (int j = n - i; j >= 1; j--) {
                System.out.print(" ");
            }
            for (int k = 1; k <= i; k++) {
                System.out.print((char) (k + 64));
            }
            for (int l = i - 1; l >= 1; l--) {
                System.out.print((char) (l + 64));
            }
            System.out.println();
        }
    }
}