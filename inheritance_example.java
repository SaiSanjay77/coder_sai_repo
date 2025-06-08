public class inheritance_example {
    public static void main(String[] args) {
        Dog dog = new Dog("Max", 3);
        dog.makeSound();
        dog.fetch();
    }
}

class Animal {
    String name;
    int age;

    Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    void makeSound() {
        System.out.println("Some sound");
    }
}

class Dog extends Animal {
    Dog(String name, int age) {
        super(name, age);
    }


    void fetch() {
        System.out.println(name + " is fetching the ball");
    }
}
