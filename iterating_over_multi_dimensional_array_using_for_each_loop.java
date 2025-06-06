public class iterating_over_multi_dimensional_array_using_for_each_loop {
    public static void main(String[] args) {
        int[][] arr = { {1, 2, 3}, {4, 5, 6}};
        for (int[] i : arr) {
            for (int j : i) {
                System.out.println(j);
            }
        }
    }
}
