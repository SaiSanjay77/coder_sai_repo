public class RaceConditionDemo {
    static int counter = 0;

    public static void main(String[] args) {
        Thread t1 = new Thread(new CountTask());
        Thread t2 = new Thread(new CountTask());

        t1.start();
        t2.start();
    }

    static class CountTask implements Runnable {
        public void run() {
            for (int i = 0; i < 1000; i++) {
                counter++;
            }
            System.out.println("Counter value: " + counter);
        }
    }
}
