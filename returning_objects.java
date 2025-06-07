public class returning_objects {
    static class Person {
        private String name;
        private int age;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() {
            return name;
        }

        public int getAge() {
            return age;
        }
    }

    public static Person createPerson(String name, int age) {
        return new Person(name, age);
    }

    public static void main(String[] args) {
        Person person1 = createPerson("John", 25);
        Person person2 = createPerson("Alice", 30);

        System.out.println("Person 1: " + person1.getName() + ", " + person1.getAge());
        System.out.println("Person 2: " + person2.getName() + ", " + person2.getAge());
    }
}
