public class nested_if_statements {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        if (a > b) {
            if (a > 20) {
                System.out.println("a is greater than 20");
            }
            else {
                System.out.println("a is not greater than 20");
            }
        }
        else {
            System.out.println("a is not greater than b");
        }
    }
}
