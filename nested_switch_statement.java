public class nested_switch_statement {
    public static void main(String[] args) {
        String[] categories = {"Electronics", "clothing"};
        String[][] items = {
                {"laptop", "phone"},
                {"shirt", "pants"}
        };
        for (int i = 0; i < categories.length; i++) {
            String category = categories[i];
            switch (category) {
                case "Electronics":
                    for (String item : items[i]) {
                        switch (item) {
                            case "laptop":
                                System.out.println("Laptop");
                                break;
                            case "phone":
                                System.out.println("Phone");
                                break;
                        }
                    }
                    break;
                case "clothing":
                    for (String item : items[i]) {
                        switch (item) {
                            case "shirt":
                                System.out.println("Shirt");
                                break;
                            case "pants":
                                System.out.println("Pants");
                                break;
                        }
                    }
                    break;
            }
        }
    }
}
