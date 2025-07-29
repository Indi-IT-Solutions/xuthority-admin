import { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface TrustedTechFormProps {
  register: any;
  errors: any;
  setValue?: any;
  watch?: any;
}

interface CardData {
  id: string;
  heading: string;
  subtext: string;
}

export const TrustedTechForm: React.FC<TrustedTechFormProps> = ({ register, errors }) => {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: "1",
      heading: "Amplify Customer Feedback",
      subtext: "We simplify the process of gathering customer feedback, ensuring their voices are heard and helping you build trust."
    },
    {
      id: "2",
      heading: "",
      subtext: ""
    }
  ]);

  const addCard = () => {
    const newCard: CardData = {
      id: Date.now().toString(),
      heading: "",
      subtext: ""
    };
    setCards([...cards, newCard]);
  };

  const removeCard = (cardId: string) => {
    if (cards.length > 1) {
      setCards(cards.filter(card => card.id !== cardId));
    }
  };

  return (
    <>
      {/* Cards Section */}
      <div className="space-y-8">
        {cards.map((card, index) => (
          <div key={card.id} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Card {index + 1}</h3>
              {cards.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCard(card.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <FormField
              id={`card-${card.id}-heading`}
              label="Heading"
              placeholder="Write heading..."
              register={register}
              error={errors?.[`card-${card.id}-heading`]}
            />
            
            <FormField
              id={`card-${card.id}-subtext`}
              label="Subtext"
              type="textarea"
              rows={4}
              placeholder="Enter subtext here..."
              register={register}
              error={errors?.[`card-${card.id}-subtext`]}
            />
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={addCard}
        className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add More
      </Button>

      {/* Add Button Section */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-semibold">Add Button</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="buttonText"
            label="Button Text"
            placeholder="Enter button text..."
            register={register}
            error={errors?.buttonText}
          />
          
          <FormField
            id="buttonLink"
            label="Button Link"
            placeholder="Enter button redirection link..."
            register={register}
            error={errors?.buttonLink}
          />
        </div>
      </div>
    </>
  );
};