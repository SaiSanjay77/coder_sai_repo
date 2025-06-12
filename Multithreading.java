public class Multithreading {
    static class Counter implements Runnable {
        private String name;
        private int count;

        public Counter(String name) {
            this.name = name;
            this.count = 0;
        }

        @Override
        public void run() {
            try {
                for (int i = 1; i <= 5; i++) {
                    count++;
                    System.out.println(name + ": Count is " + count);
                    Thread.sleep(1000);
                }
            } catch (InterruptedException e) {
                System.out.println(name + " interrupted.");
            }
        }
    }

    public static void main(String[] args) {
        Counter counter1 = new Counter("Thread 1");
        Counter counter2 = new Counter("Thread 2");

        Thread thread1 = new Thread(counter1);
        Thread thread2 = new Thread(counter2);

        thread1.start();
        thread2.start();
        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            System.out.println("Main thread interrupted.");
        }
        System.out.println("Main thread exiting.");


    }
}
