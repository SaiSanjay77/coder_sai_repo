public class multi_dimensional_array_improved_using_for_loop
{
    public static void main(String[] args)
    {
        int[][] arr = new int[4][5];
        int a,b,c;
        c=0;
        for (a = 0; a < arr.length; a++)
        {
            for (b = 0; b < arr[a].length; b++)
            {
                arr[a][b] = c;
                c++;
                System.out.println(arr[a][b]);
            }
        }
    }
}
