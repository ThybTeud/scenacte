import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Heart, Share2, Download, Undo2, Redo2, Loader2, Plus, Trash2 } from 'lucide-react';

const DevPlayground = () => {
  return (
    <div className="min-h-screen bg-surface-base p-8 space-y-12">
      <h1 className="text-2xl font-heading font-bold">Design System — Boutons</h1>

      {/* ─── Boutons plats (dans une surface) ─── */}
      <section>
        <h2 className="text-lg font-semibold mb-4 border-b-2 border-border pb-2">Boutons plats — dans une surface</h2>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Variantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Variantes */}
            <div className="flex flex-wrap gap-3 items-center">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            {/* Tailles */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Tailles</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Icônes */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Icônes</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="icon-sm" variant="secondary"><Heart className="h-4 w-4" /></Button>
                <Button size="icon" variant="secondary"><Share2 className="h-4 w-4" /></Button>
                <Button size="icon-lg" variant="secondary"><Download className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Avec icône + texte */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Icône + texte</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button><Download className="h-4 w-4" />Exporter</Button>
                <Button variant="secondary"><Plus className="h-4 w-4" />Ajouter</Button>
                <Button variant="destructive"><Trash2 className="h-4 w-4" />Supprimer</Button>
              </div>
            </div>

            {/* États */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">États — disabled & loading</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="destructive" disabled>Disabled</Button>
                <Button disabled><Loader2 className="h-4 w-4 animate-spin" />Chargement...</Button>
              </div>
            </div>

            {/* Groupe plat */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Groupe — flat</p>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex">
                  <Button variant="secondary" size="icon" className="rounded-r-none border-r">
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-l-none border-l">
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex">
                  <Button variant="secondary" className="rounded-r-none border-r">Annuler</Button>
                  <Button className="rounded-l-none border-l">Confirmer</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── Boutons profonds (sur le fond) ─── */}
      <section>
        <h2 className="text-lg font-semibold mb-4 border-b-2 border-border pb-2">Boutons profonds — sur le fond</h2>
        <div className="space-y-6">
          {/* Variantes raised */}
          <div className="flex flex-wrap gap-3 items-center">
            <Button depth="raised">Default</Button>
            <Button depth="raised" variant="secondary">Secondary</Button>
            <Button depth="raised" variant="destructive">Destructive</Button>
          </div>

          {/* Tailles raised */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tailles</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button depth="raised" size="sm">Small</Button>
              <Button depth="raised" size="default">Default</Button>
              <Button depth="raised" size="lg">Large</Button>
            </div>
          </div>

          {/* Icônes raised */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Icônes</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button depth="raised" size="icon-sm" variant="secondary"><Heart className="h-4 w-4" /></Button>
              <Button depth="raised" size="icon" variant="secondary"><Share2 className="h-4 w-4" /></Button>
              <Button depth="raised" size="icon-lg" variant="secondary"><Download className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Avec icône + texte raised */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Icône + texte</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button depth="raised"><Download className="h-4 w-4" />Exporter</Button>
              <Button depth="raised" variant="secondary"><Plus className="h-4 w-4" />Ajouter</Button>
            </div>
          </div>

          {/* États raised */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">États — disabled & loading</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button depth="raised" disabled>Disabled</Button>
              <Button depth="raised" variant="secondary" disabled>Disabled</Button>
              <Button depth="raised" disabled><Loader2 className="h-4 w-4 animate-spin" />Chargement...</Button>
            </div>
          </div>

          {/* Groupe raised */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Groupe — raised</p>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex">
                <Button depth="raised" variant="secondary" size="icon" className="rounded-r-none border-r">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button depth="raised" variant="secondary" size="icon" className="rounded-l-none border-l">
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex">
                <Button depth="raised" variant="secondary" className="rounded-r-none border-r">Annuler</Button>
                <Button depth="raised" className="rounded-l-none border-l">Confirmer</Button>
              </div>
            </div>
          </div>

          {/* Ghost/Link restent toujours flat */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Ghost & Link — toujours flat (sécurité compound variants)</p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button depth="raised" variant="ghost">Ghost (forcé flat)</Button>
              <Button depth="raised" variant="link">Link (forcé flat)</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Champs de saisie ─── */}
      <section>
        <h2 className="text-lg font-semibold mb-4 border-b-2 border-border pb-2">Champs de saisie — dans une surface</h2>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Input, Textarea, Select</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Input</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demo-input">Default</Label>
                  <Input id="demo-input" placeholder="Tapez quelque chose..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-input-disabled">Disabled</Label>
                  <Input id="demo-input-disabled" placeholder="Désactivé" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-input-invalid">Invalid</Label>
                  <Input id="demo-input-invalid" placeholder="Champ invalide" aria-invalid="true" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-input-value">Avec valeur</Label>
                  <Input id="demo-input-value" defaultValue="Scenacte" />
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Textarea</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demo-textarea">Default</Label>
                  <Textarea id="demo-textarea" placeholder="Décrivez..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-textarea-disabled">Disabled</Label>
                  <Textarea id="demo-textarea-disabled" placeholder="Désactivé" disabled />
                </div>
              </div>
            </div>

            {/* Select */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Select</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acte1">Acte 1</SelectItem>
                      <SelectItem value="acte2">Acte 2</SelectItem>
                      <SelectItem value="acte3">Acte 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Disabled</Label>
                  <Select disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Désactivé" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x">X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DevPlayground;
