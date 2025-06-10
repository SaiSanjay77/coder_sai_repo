public class exception_handling2 {
    public static class AgeException extends Exception {
        public AgeException(String message) {
            super(message);
        }
    }

    public static void validateAge(int age) throws AgeException {
        if (age < 18) {
            throw new AgeException("Age must be 18 or above");
        }
        System.out.println("Valid age: " + age);
    }

    public static void main(String[] args) {
        try {
            validateAge(22);
        } catch (AgeException e) {
            System.out.println("Age validation failed: " + e.getMessage());
        } finally {
            System.out.println("Age validation completed");
        }
    }
}
