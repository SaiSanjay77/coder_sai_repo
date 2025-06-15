public class ThreadLifecycle {
    public static void main(String[] args) {
        Thread t = new Thread(new MyTask());
        System.out.println("Before start: " + t.getState());
        t.start();
        System.out.println("After start: " + t.getState());
    }
}

class MyTask implements Runnable {
    public void run() {
        System.out.println("Thread is running");
    }
}
