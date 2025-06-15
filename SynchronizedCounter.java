public class SynchronizedCounter {
    static int counter = 0;

    public static void main(String[] args) {
        Thread t1 = new Thread(new SafeTask());
        Thread t2 = new Thread(new SafeTask());

        t1.start();
        t2.start();
    }

    static class SafeTask implements Runnable {
        public void run() {
            for (int i = 0; i < 1000; i++) {
                synchronized(SynchronizedCounter.class) {
                    counter++;
                }
            }
            System.out.println("Safe counter value: " + counter);
        }
    }
}
