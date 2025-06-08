public class overloading_var_args_methods {
    public static void sum(int... numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        System.out.println("Sum: " + total);
    }

    public static void sum(String message, int... numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        System.out.println(message + total);
    }

    public static void sum(String message, String separator, int... numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        System.out.println(message + separator + total);
    }

    public static void main(String[] args) {
        sum(1, 2, 3);
        sum("Result: ", 4, 5, 6);
        sum("Total", " = ", 7, 8, 9);
    }
}
