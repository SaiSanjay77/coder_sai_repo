import java.util.Scanner;
    public class multiplication_table_weird {
        public static void main(String[] args) {
            Scanner s = new Scanner(System.in);
            System.out.println("Enter the number to print the multiplication table of: ");
            int n = s.nextInt();
            for(int i = 1; i <= n; i++) {
                for(int j = 1; j <= n; j++) {
                    System.out.println(i + " * " + j + " = " + i * j);
                }
            }
        }
    }