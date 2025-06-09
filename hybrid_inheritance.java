public class hybrid_inheritance {
    public static void main(String[] args) {
        Duck duck = new Duck();
        duck.makeSound();
        duck.fly();
        duck.swim();
    }
}

class Animal3 {
    void makeSound() {
        System.out.println("Animal makes a sound");
    }
}

interface Swimmer {
    void swim();
}

class Bird extends Animal3 {
    void fly() {
        System.out.println("Bird is flying");
    }
}

class Duck extends Bird implements Swimmer {
    @Override
    void makeSound() {
        System.out.println("Duck quacks");
    }

    @Override
    public void swim() {
        System.out.println("Duck is swimming");
    }
}
