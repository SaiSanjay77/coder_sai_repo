public class exception_handling {
    public static class CustomException extends Exception {
        public CustomException(String message) {
            super(message);
        }
    }

    public static void checkAge(int age) throws CustomException {
        if (age < 0) {
            throw new CustomException("Age cannot be negative");
        }
    }

    public static void main(String[] args) {
        // Example 1: Simple try-catch
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero: " + e.getMessage());
        }

        // Example 2: Multiple catch blocks
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Generic error: " + e.getMessage());
        }

        // Example 3: Try-catch-finally
        try {
            String str = null;
            str.length();
        } catch (NullPointerException e) {
            System.out.println("Null pointer error: " + e.getMessage());
        } finally {
            System.out.println("This block always executes");
        }

        // Example 4: Custom exception
        try {
            checkAge(-5);
        } catch (CustomException e) {
            System.out.println("Custom exception: " + e.getMessage());
        }
    }
}
