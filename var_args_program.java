public class var_args_program {
    public static void sum(String msg, int... numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        System.out.println(msg + total);
    }

    public static void main(String[] args) {
        sum("Sum of 2 numbers: ", 10, 20);
        sum("Sum of 3 numbers: ", 10, 20, 30);
        sum("Sum of 4 numbers: ", 10, 20, 30, 40);
        sum("Sum of no numbers: ");
    }
}

