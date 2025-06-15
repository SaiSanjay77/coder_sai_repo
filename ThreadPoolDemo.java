import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        executor.submit(new MyTask7("Task 1"));
        executor.submit(new MyTask7("Task 2"));

        executor.shutdown();
    }
}

class MyTask7 implements Runnable {
    String name;

    MyTask7(String name) {
        this.name = name;
    }

    public void run() {
        System.out.println(name + " is running");
    }
}
