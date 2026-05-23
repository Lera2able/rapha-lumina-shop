import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen">
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-balance">Size Guide</h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Apparel Sizing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Chest (cm)</th>
                      <th className="text-left p-2">Length (cm)</th>
                      <th className="text-left p-2">Sleeve (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">XS</td>
                      <td className="p-2">86-91</td>
                      <td className="p-2">68</td>
                      <td className="p-2">20</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">S</td>
                      <td className="p-2">91-96</td>
                      <td className="p-2">70</td>
                      <td className="p-2">21</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">M</td>
                      <td className="p-2">96-101</td>
                      <td className="p-2">72</td>
                      <td className="p-2">22</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">L</td>
                      <td className="p-2">101-106</td>
                      <td className="p-2">74</td>
                      <td className="p-2">23</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">XL</td>
                      <td className="p-2">106-111</td>
                      <td className="p-2">76</td>
                      <td className="p-2">24</td>
                    </tr>
                    <tr>
                      <td className="p-2">2XL</td>
                      <td className="p-2">111-116</td>
                      <td className="p-2">78</td>
                      <td className="p-2">25</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Measure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Chest</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Measure around the fullest part of your chest, keeping the tape measure horizontal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Length</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Measure from the highest point of the shoulder to the bottom hem.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sleeve</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Measure from the shoulder seam to the end of the sleeve.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
