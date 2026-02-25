import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import styles from "./styles.module.css";

type Attribution = {
  title: string;
  author: string;
  source: string;
  url: string;
  license: string;
};

const ATTRIBUTIONS: Attribution[] = [
  {
    title: "Photographic film icons",
    author: "Shahid-Mehmood",
    source: "Flaticon",
    url: "https://www.flaticon.com/free-icons/photographic-film",
    license: "Flaticon License",
  },
];

export function Attribution() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Attributions</h1>
      <p className={styles.subtitle}>
        This project uses the following third-party assets. Thank you to their
        creators.
      </p>
      <div className={styles.list}>
        {ATTRIBUTIONS.map((item) => {
          return (
            <Card key={item.url}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className={styles.table}>
                  <tbody>
                    <tr>
                      <th>Author</th>
                      <td>{item.author}</td>
                    </tr>
                    <tr>
                      <th>Source</th>
                      <td>{item.source}</td>
                    </tr>
                    <tr>
                      <th>License</th>
                      <td>{item.license}</td>
                    </tr>
                    <tr>
                      <th>Link</th>
                      <td>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {item.url}
                          <ExternalLink size={14} className={styles.linkIcon} />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
