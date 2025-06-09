class Animal1 {
    String type = "Animal";

    void eat() {
        System.out.println("Animal is eating");
    }
}

class Dog1 extends Animal1 {
    String breed;

    void bark() {
        System.out.println("Dog is barking");
    }
}

class Puppy extends Dog1 {
    int age;

    void play() {
        System.out.println("Puppy is playing");
    }
}

public class Multilevel_Inheritance {
    public static void main(String[] args) {
        Puppy puppy = new Puppy();
        puppy.eat();    // inherited from Animal
        puppy.bark();   // inherited from Dog
        puppy.play();   // own method
    }
}