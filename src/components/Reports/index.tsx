import Link from 'next/link';
import { Table } from 'react-bootstrap';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';

interface Data {
    link: string;
    item: String[];
}

interface ReportProps {
    header: String[];
    data: Data[];
}

const Reports: React.FC<ReportProps> = ({ header, data }) => {
    return (
        <Table striped hover size="sm" responsive>
            <thead>
                <tr>
                    {
                        header.map((thItem, index) => {
                            return <th key={index}>{thItem}</th>
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    data && data.map((trItem, index) => {
                        return <tr key={index}>
                            {
                                trItem.item.map((tdItem, index) => {
                                    return <td key={index}>{tdItem}</td>
                                })
                            }

                            <td>
                                <Link href={trItem.link}>
                                    <a target="_blank" title="Abrir este item em outra aba.">
                                        <h5><FaExternalLinkSquareAlt /></h5>
                                    </a>
                                </Link>
                            </td>
                        </tr>
                    })
                }
            </tbody>
            <caption>{`Registros encontrados: ${data.length}`}</caption>
        </Table>
    )
}

export default Reports;