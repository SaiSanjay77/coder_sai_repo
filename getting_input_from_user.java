import java.util.Scanner;
public class getting_input_from_user {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Please enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        System.out.println("Enter your age: ");
        int age = scanner.nextInt();
        scanner.close();
    }
}