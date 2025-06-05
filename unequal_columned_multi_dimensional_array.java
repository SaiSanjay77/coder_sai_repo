public class unequal_columned_multi_dimensional_array {
    public static void main(String[] args) {
        int[][] arr = new int[4][];
        int c = 0;
        arr[0] = new int[3];
        arr[1] = new int[2];
        arr[2] = new int[4];
        arr[3] = new int[1];
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr[i].length; j++) {
                arr[i][j] = c;
                c++;
                System.out.println(arr[i][j]+ "");
                System.out.println("\n");
            }
        }
    }
}
