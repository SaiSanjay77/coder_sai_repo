import java.util.Scanner;
public class getting_input_from_user {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        System.out.println("Please enter your name: ");
        String name = s.nextLine();
        System.out.println("Hello, " + name + "!");
        System.out.println("Enter your age: ");
        int age = s.nextInt();

    }
}