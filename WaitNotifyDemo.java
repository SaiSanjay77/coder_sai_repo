public class WaitNotifyDemo {
    static String message = "";
    static final Object lock = new Object();

    public static void main(String[] args) {
        Thread producer = new Thread(new Producer());
        Thread consumer = new Thread(new Consumer());

        producer.start();
        consumer.start();
    }

    static class Producer implements Runnable {
        public void run() {
            synchronized(lock) {
                message = "Hello from Producer!";
                lock.notify(); // Notify waiting consumer
            }
        }
    }

    static class Consumer implements Runnable {
        public void run() {
            synchronized(lock) {
                try {
                    lock.wait(); // Wait for producer
                } catch (InterruptedException e) {
                    return;
                }
                System.out.println("Received: " + message);
            }
        }
    }
}
