public class nested_class {
    private int outerVar = 10;

    public void outerMethod() {
        System.out.println("Outer class method");
    }

    // Static nested class
    static class StaticNested {
        public void staticNestedMethod() {
            System.out.println("Static nested class method");
        }
    }

    // Non-static inner class
    class Inner {
        public void innerMethod() {
            System.out.println("Inner class method, can access outerVar: " + outerVar);
        }
    }

    public static void main(String[] args) {
        // Creating instance of static nested class
        StaticNested staticNested = new StaticNested();
        staticNested.staticNestedMethod();

        // Creating instance of inner class requires outer class instance
        nested_class outer = new nested_class();
        Inner inner = outer.new Inner();
        inner.innerMethod();

        // Calling outer class method
        outer.outerMethod();
    }
}
