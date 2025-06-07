public class string_class_methods {
    public static void main(String[] args) {
        String str = "Hello, World!";
        String str2 = "Java Programming";

        // charAt() demonstration
        System.out.println("Character at index 0: " + str.charAt(0));
        System.out.println("Character at index 7: " + str.charAt(7));

        // length() demonstration
        System.out.println("Length of str: " + str.length());

        // substring() demonstration
        System.out.println("Substring (0,5): " + str.substring(0, 5));

        // toLowerCase() and toUpperCase() demonstration
        System.out.println("Lowercase: " + str.toLowerCase());
        System.out.println("Uppercase: " + str.toUpperCase());

        // indexOf() demonstration
        System.out.println("Index of 'World': " + str.indexOf("World"));

        // contains() demonstration
        System.out.println("Contains 'Java': " + str2.contains("Java"));

        // replace() demonstration
        System.out.println("Replace: " + str.replace("Hello", "Hi"));

        // trim() demonstration
        String str3 = "   Spaces   ";
        System.out.println("Trim: '" + str3.trim() + "'");
    }
}
