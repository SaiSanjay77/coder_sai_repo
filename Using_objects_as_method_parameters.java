public class Using_objects_as_method_parameters {
    static class Student {
        private String name;
        private int age;

        public Student(String name, int age) {
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

    public static void compareStudents(Student s1, Student s2) {
        if (s1.getAge() > s2.getAge()) {
            System.out.println(s1.getName() + " is older than " + s2.getName());
        } else if (s1.getAge() < s2.getAge()) {
            System.out.println(s2.getName() + " is older than " + s1.getName());
        } else {
            System.out.println(s1.getName() + " and " + s2.getName() + " are of the same age");
        }
    }

    public static void main(String[] args) {
        Student student1 = new Student("John", 20);
        Student student2 = new Student("Jane", 22);
        compareStudents(student1, student2);
    }
}