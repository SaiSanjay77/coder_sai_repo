public class ThreadDemo {
    public static void main(String[] args) {
        Thread t1 = new Thread(new MyTask1());
        Thread t2 = new Thread(new MyTask2());

        t1.start();
        t2.start();
    }
}

class MyTask1 implements Runnable {
    public void run() {
        System.out.println("Thread 1 is running");
    }
}

class MyTask2 implements Runnable {
    public void run() {
        System.out.println("Thread 2 is running");
    }
}
